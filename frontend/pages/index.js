import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Home(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();

  async function login(){
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    router.push('/dashboard');
  }

  async function register(){
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await axios.post(`${apiUrl}/api/auth/register`, { email, password });
    localStorage.setItem('token', res.data.token);
    router.push('/dashboard');
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
          <button onClick={login}>Login</button>
          <button onClick={register} style={{marginLeft:8}}>Register</button>
        </div>
      </div>
    </Layout>
  )
}
