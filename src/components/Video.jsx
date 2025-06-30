import { useRef, useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import videos from '../assets/videos.json'; // ajuste le chemin si besoin
import "../styles/main.scss";
import playButton from '../assets/images/play.PNG';
import pauseButton from '../assets/images/pause.PNG';
import sendButton from '../assets/images/send.PNG';
import rockSound from '../assets/rock.wav';

const Video = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // Gestion des réponses
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handlePlayPause = () => {
    const audio = new Audio(rockSound);
    audio.play();

    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReady = (e) => {
    if (e) e.preventDefault();

    const audio = new Audio(rockSound);
    audio.play();

    if (count === 0) {
      setCount(1);
      setIsReady(true);
      setIsPlaying(false);
      setVideoEnded(false);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.load();
      }
    } else {
      if (currentAnswer.trim() !== '') {
        setAnswers(prev => [...prev, currentAnswer.trim()]);
        setCurrentAnswer('');
        setCount(prev => prev + 1);
        setVideoEnded(false);
      }
    }
  };

  // Démarrer la vidéo automatiquement si prête
  useEffect(() => {
    if (isReady && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.log("Lecture automatique bloquée :", err);
          setIsPlaying(false);
        });
    }
  }, [count, isReady]);

  useEffect(() => {
    console.log('Enviraonnement :', import.meta.env);
  }, []);

  // Événement : vidéo terminée
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setVideoEnded(true);
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [count]);

  // Fonction d'envoi EmailJS avec debug
  const sendAnswersByEmail = async () => {
    console.log("Début envoi EmailJS");
    console.log("Service ID:", import.meta.env.VITE_EMAILJS_SERVICE_ID);
    console.log("Template ID:", import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
    console.log("Public Key:", import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

    const message = answers.map((a, i) => `${i + 1}. ${a}`).join('\n');

    const templateParams = {
      message: message,
    };

    try {
      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      console.log("✅ Email envoyé :", result.text);
    } catch (error) {
      console.error("❌ Erreur EmailJS :", error);
    }
  };

  // Déclenchement de l'envoi après 2 réponses
  useEffect(() => {
    console.log("answers.length =", answers.length);
    if (answers.length === 21) {
      console.log("sendAnswersByEmail() appelé");
      sendAnswersByEmail();
    }
  }, [answers]);

  const currentVideo = videos[isReady ? count : 0];

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        key={currentVideo.src}
        src={currentVideo.src}
        width="100%"
        type="video/mp4"
        controls={false}
      >
        Votre navigateur ne supporte pas la vidéo.
      </video>

      {count === 0 ? (
        <nav>
          <button onClick={handlePlayPause} className="play-button">
            {isPlaying ? <img src={pauseButton} alt="Pause" /> : <img src={playButton} alt="Play" />}
          </button>
          <button onClick={handleReady} className="ready-button">
            <img src={sendButton} alt="Send" />
          </button>
        </nav>
      ) : count >= 1 && count < 22 ? (
        <nav>
          <form onSubmit={handleReady}>
            <textarea
              id="answerInput"
              className={`answer-textarea ${videoEnded ? 'tv-on' : ''}`}
              placeholder="Répondez ici..."
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
            ></textarea>
            {videoEnded && (
              <button type="submit" className="ready-button">
                <img src={sendButton} alt="Send" />
              </button>
            )}
          </form>
        </nav>
      ) : null}
    </div>
  );
};

export default Video;
