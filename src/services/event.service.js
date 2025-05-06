const AWS = require('aws-sdk');

const eventBridge = new AWS.EventBridge({
  region: 'us-east-1',
  accessKeyId: process.env.EDA_AK,
  secretAccessKey: process.env.EDA_SK,
});

// Publicar evento UsuarioCreado
const publicarUsuarioCreado = async (user) => {
  const eventDetail = {
    userId: user._id,
    username: user.username,
    email: user.email,
    userType: user.userType, // "patient" o "therapist"
    createdAt: new Date().toISOString(),
  };

  const params = {
    Entries: [
      {
        Source: 'Menta.Users',
        DetailType: 'UsuarioCreado',
        Detail: JSON.stringify(eventDetail),
        EventBusName: 'event-bus',
      },
    ],
  };

  try {
    const result = await eventBridge.putEvents(params).promise();
    console.log('Evento UsuarioCreado enviado correctamente:', result);
  } catch (error) {
    console.error('Error al enviar el evento UsuarioCreado:', error);
  }
};

module.exports = {
  publicarUsuarioCreado,
};