import {useRef} from "react";

const App = () => {
  const canvasRef = useRef(null);

  const record = async () => {
    // 生成流
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    // 创建解析器，以及音频上下文
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const analyser = audioCtx.createAnalyser()

    // 连接
    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)
    // 禁止输出，否会出现回音
    // analyser.connect(audioCtx.destination);

    // 获取音频数据
    analyser.fftSize = 2048
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength)

    // 可视化
    const WIDTH = canvasRef.current.width;
    const HEIGHT = canvasRef.current.height;
    const canvasCtx = canvasRef.current.getContext("2d");

    // 清空
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    const draw = () => {
      // 递归调用
      requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(dataArray)

      // 绘制图形
      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

      canvasCtx.beginPath();

      const sliceWidth = WIDTH * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {

        const v = dataArray[i] / 128.0;
        const y = v * HEIGHT / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
      canvasCtx.stroke();
    }

    draw()
  }

  return (
    <div className="App">
      <canvas ref={canvasRef} width={500} height={300}/>
      <button onClick={record}>开始</button>
    </div>
  );
}

export default App;
