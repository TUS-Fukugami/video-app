// サーバと接続 (joinしたら接続開始)
const socket = io({
  autoConnect: false,
});

const app = Vue.createApp({
  data() {
    return {
      message: "",
      // メッセージリスト化のため
      messages: [],
      // ユーザ名とルーム番号
      name: "",
      roomId: "",
      // メンバーリスト
      members: [],
      // PeerJSのため
      myPeer,
    };
  },
  methods: {
    // message送信のメソッド
    sendMessage() {
      // サーバへmessageを送信
      socket.emit("message", this.message);
      this.message = "";
    },
    // ルームに参加するメソッド
    joinRoom(roomId) {
      this.roomId = roomId;
      // PeerJSのインスタンス生成
      this.myPeer = new Peer(undefined, {
        host: "/",
        port: 3000,
        path: "/peerjs",
        debug: 3,
      });
      socket.open();
      // PeerJSサーバに接続したらメッセージ送信
      this.myPeer.on("open", (peerId) => {
        socket.emit("join-room", this.roomId, this.name, peerId);
      });
    },
    // 退室時の初期化
    leaveRoom() {
      this.roomId = "";
      this.name = "";
      this.messages = [];
      this.members = [];
      socket.close();
    },
  },
  mounted() {
    // サーバから送信されたmessageを受け取る
    socket.on("message", (msg) => {
      // 配列にメッセージを追加
      this.messages.push(msg);
    });
    // membersにサーバから受信されたメンバーリストを追加
    socket.on("members", (members) => {
      this.members = members;
    });
    // user-connectedイベントの処理
    socket.on("user-connected", (peerId) => {
      console.log(peerId);
    });
  },
}).mount("#app");
