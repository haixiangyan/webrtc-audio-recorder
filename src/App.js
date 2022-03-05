import {useRef, useState} from "react";
import testAudio from './test.flac';

const App = () => {
  const [audioUrl, setAudioUrl] = useState(testAudio);

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const barCanvasRef = useRef(null);

  const play = async () => {
    await audioRef.current.play();
    const stream = audioRef.current.captureStream();
    visualize(stream)
    visualizeBar(stream);
  }

  const playUrl = async () => {
    const url = 'https://github.yanhaixiang.com/webrtc-audio-visualization/webrtc-audio-visualization/static/media/test.912f161b068ec6db15fb.flac';
    const audio = new Audio(url)
    await audio.play();
    const stream = audio.captureStream();
    visualize(stream)
  }

  const record = async () => {
    // 生成流
    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
    visualize(stream)
  }

  const visualize = (stream, shouldOutput = false) => {
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

        const v = dataArray[i] / 255.0;
        const y = v * HEIGHT;

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

  const visualizeBar = (stream, shouldOutput = false) => {
    // 创建解析器
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const analyser = audioCtx.createAnalyser();

    // 获取音频源
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    if (shouldOutput) {
      analyser.connect(audioCtx.destination);
    }

    // 可视化
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // 可视化
    const WIDTH = barCanvasRef.current.width;
    const HEIGHT = barCanvasRef.current.height;
    const canvasCtx = barCanvasRef.current.getContext("2d");

    // 清空
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    const draw = () => {
      // 递归调用
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // 绘制图形
      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 2.5
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i];

        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',255,255)';
        canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }
    draw();
  }

  const onPreview = (e) => {
    const [file] = e.target.files;

    const url = URL.createObjectURL(file);

    setAudioUrl(url);
  }

  return (
    <div className="App">
      <audio ref={audioRef} src={audioUrl} controls onPlay={() => play()}/>
      <canvas ref={canvasRef} width={500} height={300}/>
      <canvas ref={barCanvasRef} width={500} height={300}/>
      <button onClick={play}>播放</button>
      <button onClick={playUrl}>播放URL</button>
      <button onClick={record}>录音</button>
      <input type="file" onChange={onPreview}/>
    </div>
  );
}

export default App;
