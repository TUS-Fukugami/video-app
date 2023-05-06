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
      roomID: "",
      // メンバーリスト
      members: [],
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
    // membersにサーバから受信されたメンバーリストを追加
    socket.on("members", (members) => {
      this.members = members;
    });
  },
}).mount("#app");
