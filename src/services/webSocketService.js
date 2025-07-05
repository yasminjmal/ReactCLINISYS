import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:9010/template-core/ws';

let stompClient;

const webSocketService = {
  connect: (onMessageReceived) => {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
    });

    stompClient.onConnect = (frame) => {
      console.log('Connecté au serveur WebSocket: ' + frame);

      // Abonnement uniquement ici, quand la connexion est prête
      stompClient.subscribe('/topic/dashboard-updates', (message) => {
        try {
          const parsedNotification = JSON.parse(message.body);
          onMessageReceived(parsedNotification);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error, message.body);
          onMessageReceived({ message: message.body, timestamp: new Date().toISOString() });
        }
      });
    };

    // Ne pas faire subscribe ici, sinon erreur !
    // stompClient.subscribe('/topic/dashboard-updates', ...);  <- à supprimer

    stompClient.activate();
  },

  disconnect: () => {
    if (stompClient) {
      stompClient.deactivate();
      console.log('Déconnecté du serveur WebSocket.');
    }
  },
};

export default webSocketService;
