import { Turnstile } from '@marsidev/react-turnstile';
import React, { useRef } from 'react';

export default function Captcha() {
  const formRef = React.useRef(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(formRef.current)
    const token = formData.get('cf-turnstile-response')
    console.log("Token: " + token)

    try {

      const res = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token })
      });

      const data = await res.json();

      if (data.success) {
        console.log('TOKEN IS GOOOOOOOOD');
      } else {
        console.error('TOKEN IS BAAAAAD:', data.error);
      }

    } catch (err) {
      console.error('Error verifying Turnstile Token:', err);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="text" placeholder="username" />
      <input type="password" placeholder="password" />
      <Turnstile siteKey='1x00000000000000000000AA' />
      <button type='submit'>Login</button>
    </form>
  )
}
