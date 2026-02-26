import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Home(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function authRequest(url, payload) {
    try {
      return await axios.post(url, payload, { timeout: 60000 });
    } catch (err) {
      const shouldRetry = !err?.response || err?.response?.status === 502;
      if (!shouldRetry) throw err;
      await new Promise(resolve => setTimeout(resolve, 2500));
      return axios.post(url, payload, { timeout: 60000 });
    }
  }

  async function login(){
    if (!email.trim() || !password.trim()) {
      alert('Email and password are required');
      return;
    }
    try {
      setSubmitting(true);
      const res = await authRequest('/api/proxy/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err) {
      const base = err?.response?.data?.error || err?.message || 'Login failed. Please try again in a few seconds.';
      const target = err?.response?.data?.target;
      const message = target ? `${base}\nTarget: ${target}` : base;
      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function register(){
    if (!email.trim() || !password.trim()) {
      alert('Email and password are required');
      return;
    }
    try {
      setSubmitting(true);
      const res = await authRequest('/api/proxy/auth/register', { email, password });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err) {
      const base = err?.response?.data?.error || err?.message || 'Registration failed. Please try again in a few seconds.';
      const target = err?.response?.data?.target;
      const message = target ? `${base}\nTarget: ${target}` : base;
      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title="Login">
      <div className="auth-card">
        <h1>Personal Finance</h1>
        <p>Track expenses, categorize and chart them.</p>
        <p style={{fontSize:'0.9rem',color:'#555'}}>Built with Next.js, React, Express & Prisma (SQLite).<br/>This demo site is portfolio-ready – sign up and explore.</p>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{marginTop:10}}>
          <button onClick={login} disabled={submitting}>{submitting ? 'Please wait...' : 'Login'}</button>
          <button onClick={register} disabled={submitting} style={{marginLeft:8}}>{submitting ? 'Please wait...' : 'Register'}</button>
        </div>
      </div>
    </Layout>
  )
}
