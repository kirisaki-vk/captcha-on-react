import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { getAxiosCapthchaInstance } from './lib/captchaAxios';

function App() {
  const [num, setNum] = useState<number>();
  const [res, setRes] = useState<string[]>()
  const axiosClient = getAxiosCapthchaInstance(import.meta.env.VITE_CAPTCHA_API_KEY, import.meta.env.VITE_CAPTCHA_CDN_URL, "captcha_container")
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const handleSubmit = () => {
    const requests = Array().fill(new Promise<void>((resolve, reject) => {
      sleep(1000);
      axiosClient.get("https://api.prod.jcloudify.com/whoami").catch((e) => {
        setRes(old => {
          old?.push(`${e}`);
          return old
        })
      })
      resolve()
    }), 0, num);

    Promise.all(requests)
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
        <form onSubmit={(ev) => {
          ev.preventDefault();
          console.log(ev.target);
          handleSubmit()
        }}>
          <input name='value' value={num} type='number' placeholder='Please enter a number betwen 1 and 1000'
            onChange={(ev) => {
              setNum(+ev.target.value)
            }}
          />
          <button type='submit'>
            Submit
          </button>
        </form>
        <div>
          {(res?.map((err) => <p>{err}</p>))}
        </div>
        <div id="captcha-container">
          {/* Captcha will render here */}
        </div>
      </div>
    </>
  )
}

export default App
