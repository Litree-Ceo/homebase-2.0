import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const startSignalR = () => {
  if (process.env.NEXT_PUBLIC_ENABLE_SIGNALR !== 'true') {
    return null;
  }

  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    return connection;
  }

  const hubUrl =
    process.env.NEXT_PUBLIC_SIGNALR_URL ||
    process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ||
    '/api/hub';

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build();

  connection.start()
    .then(() => console.log('SignalR Connected'))
    .catch(err => console.error('SignalR Connection Error: ', err));

  connection.on('NewPost', (post) => { 
    console.log('New Post received via SignalR:', post);
    // Update feed logic would go here
  });

  connection.on('NewNotification', (notif) => { 
    console.log('New Notification received via SignalR:', notif);
    // Update notifications logic would go here
  });

  return connection;
};

export const getConnection = () => connection;
