import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { getAxiosCapthchaInstance } from './lib/captchaAxios';
import axios, { AxiosError } from 'axios';
import { loadScript, renderCaptcha } from './lib/captcha';

function App() {
  const [num, setNum] = useState<number>();
  const [res, setRes] = useState<string[]>();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadScript(import.meta.env.VITE_CAPTCHA_CDN_URL)
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [res])

  const axiosClient = getAxiosCapthchaInstance(axios.create({
    baseURL: import.meta.env.VITE_API_URL
  }))

  const handleSubmit = (ev: {
    preventDefault: () => void
  }) => {
    ev.preventDefault();
    requestInterval()
  }

  function requestInterval() {
    let requestsNum = num;
    const interval = setInterval(() => {
      axiosClient.get("/whoami").catch((e: AxiosError) => {
        setRes(old => old ? old.concat(`${e.status}: ${e.status === 403 ? 'FORBIDEN' : 'METHOD NOT ALLOWED'}`): [])
        if (e.status === 405) {
          console.log("trying to render captcha");
          document.getElementById("captcha-container").style.visibility = "visible"
          renderCaptcha(import.meta.env.VITE_CAPTCHA_API_KEY, "captcha-container").then(() => {
                // add the header x-aws-waf-token: token if doing cross domain requests
                console.log("Captcha success");
                
                document.getElementById("captcha-container").style.visibility = "hidden"
                if (requestInterval) {
                    requestInterval();
                }
            }).catch(e => {
              console.log(e);
            })
          setNum(requestsNum);
          console.log("trying to sop interval");
          clearInterval(interval);
        }
      });
      if (requestsNum <= 0) {
        clearInterval(interval);
      }
      requestsNum--;
    }, 500);
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + WAF Captcha</h1>
      <div className="card">
        <form onSubmit={handleSubmit} id={"number-form-container"}>
          <input 
            name='value' 
            value={num} 
            type='number' 
            placeholder='Please enter a number betwen 1 and 1000'
            min={1}
            max={1000}
            onChange={(ev) => {
              setNum(+ev.target.value)
            }}
            id='number-form'
          />
          <button type='submit'>
            Submit
          </button>
        </form>
        <div style={{
          maxHeight: "200px",
          overflow: "auto"
        }}>
          {(res?.map((err, i) => <p key={i}>{(i + 1) + " : " + err}</p>))}
          <div ref={bottomRef}></div>
        </div>
        <div id="captcha-container">
          {/* Captcha will render here */}
        </div>
      </div>
    </>
  )
}

export default App
