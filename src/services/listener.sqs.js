const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const { credentials } = require("./credentials");
const winston = require("winston");
const userService = require("../services/user.service");

const client = new SQSClient({
  region: "us-east-1",
  credentials,
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "sqs-app.log" }),
  ],
});

const QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/205930646901/logistica"; // Cambiar si es necesario

async function processMessage(message) {
  try {
    const parsedMessage = JSON.parse(message.Body);
    const detailType = parsedMessage["detail-type"];
    const { detail } = parsedMessage;

    if (detailType === "UsuarioCreado" || detailType === "UsuarioModificado") {
      logger.info(`Procesando evento ${detailType} para usuario ${detail.userId}`);
      
      const user = {
        cuit: detail.userId,
        username: detail.username,
        password: detail.password, // Asumimos que la contraseña se incluye en el evento
        email: detail.email,
        name: detail.name || '',
        lastName: detail.lastName || '',
        user_type: detail.user_type, // 'patient' o 'therapist'
        is_admin: detail.is_admin || false,
        birth_date: detail.birth_date || null, // Solo para pacientes
        specialties: detail.specialties || [], // Solo para terapeutas
        license_number: detail.license_number || '', // Solo para terapeutas
        medical_history: detail.medical_history || '', // Solo para pacientes
      };

      if (detailType === "UsuarioCreado") {
        await userService.createUser(user);
      } else {
        await userService.updateUser(user.cuit, user);
      }
    }
  } catch (err) {
    logger.error("Error procesando mensaje:", err);
  }
}

async function receiveMessages() {
  const input = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 20,
  };

  try {
    const command = new ReceiveMessageCommand(input);
    const response = await client.send(command);
    return response.Messages || [];
  } catch (error) {
    logger.error("Error recibiendo los mensajes:", error);
    throw error;
  }
}

async function deleteMessage(receiptHandle) {
  try {
    const command = new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: receiptHandle,
    });
    await client.send(command);
    logger.info("Mensaje eliminado de la cola.");
  } catch (error) {
    logger.error("Error eliminando el mensaje:", error);
  }
}

async function pollMessages() {
  while (true) {
    try {
      const messages = await receiveMessages();
      for (const message of messages) {
        try {
          await processMessage(message);
          await deleteMessage(message.ReceiptHandle);
        } catch (error) {
          logger.error("Error procesando mensaje individual:", error);
        }
      }
    } catch (error) {
      logger.error("Error en el polling:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

pollMessages().catch((error) => {
  logger.error("Error iniciando el polling:", error);
});

module.exports = { pollMessages };