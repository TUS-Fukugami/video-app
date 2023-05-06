// サーバと接続 (joinしたら接続開始)
const socket = io({
  autoConnect: false,
});

const app = Vue.createApp({
  data() {
    return {
      message: "",
      // メッセージリスト化のために
      messages: [],
      // ユーザ名とルーム番号
      name: "",
      roomID: "",
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
    joinRoom(roomID) {
      this.roomID = roomID;
      socket.open();
      socket.emit("join-room", this.roomID, this.name);
    },
  },
  mounted() {
    // サーバから送信されたmessageを受け取る
    socket.on("message", (msg) => {
      // 配列にメッセージを追加
      this.messages.push(msg);
    });
  },
}).mount("#app");
