import {useRef} from "react";
import testAudio from './test.flac';

const App = () => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);

  const play = async () => {
    await audioRef.current.play();
    const stream = audioRef.current.captureStream();
    visualize(stream)
  }

  const playUrl = async () => {
    const url = '/static/media/test.912f161b068ec6db15fb.flac';
    const audio = new Audio(url)
    await audio.play();
    const stream = audio.captureStream();
    visualize(stream)
  }

  const record = async () => {
    // 生成流
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    visualize(stream)
  }

  const visualize = (stream, shouldOutput = false) =>  {
    // 创建解析器，以及音频上下文
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const analyser = audioCtx.createAnalyser()

    // 连接
    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)
    // 禁止输出，否会出现回音
    if (shouldOutput) {
      analyser.connect(audioCtx.destination);
    }

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
      <audio ref={audioRef} src={testAudio} controls onPlay={() => play()} />
      <canvas ref={canvasRef} width={500} height={300}/>
      <button onClick={play}>播放</button>
      <button onClick={playUrl}>播放URL</button>
      <button onClick={record}>录音</button>
    </div>
  );
}

export default App;
