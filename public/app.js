// サーバと接続 (joinしたら接続開始)
const socket = io({
  autoConnect: false,
});

// ビデオの保存リスト
const videos = [];

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
      myPeer: "",
      // ビデオ情報
      myVideo: "",
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

      // ビデオ要素作成、要素に映像データ設定
      this.myVideo = document.createElement("video");
      this.myVideo.muted = true;

      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then((stream) => {
          this.myVideo.srcObject = stream;
          this.myVideo.play();
          this.$refs.video.append(this.myVideo);

          // ビデオの送信
          this.myPeer.on("call", (call) => {
            const video = document.createElement("video");
            // ビデオリストへプッシュ
            videos.push({
              video: video,
              peerId: call.peer,
            });
            call.answer(stream);
            //コンフリクト用ダミーコメント
            // Answerの方が実行
            call.on("close", () => {
              console.log("answerしたブラウザが退出");
              video.remove();
            });
            call.on("stream", (stream) => {
              video.srcObject = stream;
              video.play();
              this.$refs.video.append(video);
            });
          });
          // user-connectedイベントの処理
          socket.on("user-connected", (peerId) => {
            const call = this.myPeer.call(peerId, stream);
            const video = document.createElement("video");
            // ビデオリストへプッシュ
            videos.push({
              video: video,
              peerId: call.peer,
            });
            call.on("stream", (stream) => {
              video.srcObject = stream;
              video.play();
              this.$refs.video.append(video);
            });
            call.on("close", () => {
              console.log("callしたブラウザで退出");
              video.remove();
            });
          });
          // 退出時の送信メッセージ
          socket.on("user-disconnected", (peerId) => {
            const video = videos.find((video) => video.peerId == peerId);
            if (video) video.video.remove();
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // 退室時の初期化
    leaveRoom() {
      this.roomId = "";
      this.name = "";
      this.messages = [];
      this.members = [];
      // PeerJSの接続情報削除
      this.myPeer.destroy();
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
  },
}).mount("#app");
