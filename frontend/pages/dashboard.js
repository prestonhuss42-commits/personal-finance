import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
const Chart = dynamic(()=>import('../components/Chart'), { ssr: false });

export default function Dashboard(){
  const router = useRouter();
  const [expenses,setExpenses]=useState([]);
  const [amount,setAmount]=useState('');
  const [desc,setDesc]=useState('');
  const [category,setCategory]=useState('misc');
  const [startDate,setStartDate]=useState('');
  const [endDate,setEndDate]=useState('');
  const [filterCategory,setFilterCategory]=useState('');
  const [editingExpense,setEditingExpense]=useState(null);
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{ 
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchExpenses(); 
  }, []);

  async function fetchExpenses(){
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('/api/proxy/expenses', { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(res.data);
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to load expenses.';
      alert(message);
    }
  }

  async function deleteExpense(id){
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/proxy/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchExpenses();
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to delete expense.';
      alert(message);
    }
  }

  function getTotal(){
    return getFilteredExpenses().reduce((sum,e)=>sum+e.amount,0).toFixed(2);
  }

  // switch to edit mode by populating form
  function startEdit(exp){
    setEditingExpense(exp);
    setAmount(exp.amount);
    setDesc(exp.description);
    setCategory(exp.category);
  }

  async function saveEdit(){
    if (!editingExpense) return;
    const parsedAmount = parseFloat(String(amount));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return alert('Enter a valid amount');
    if (!desc.trim()) return alert('Description required');
    const token = localStorage.getItem('token');
    try {
      setSubmitting(true);
      await axios.put(`/api/proxy/expenses/${editingExpense.id}`, { amount: parsedAmount, description: desc, category }, { headers: { Authorization: `Bearer ${token}` } });
      cancelEdit();
      fetchExpenses();
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to update expense.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  function cancelEdit(){
    setEditingExpense(null);
    setAmount('');
    setDesc('');
    setCategory('misc');
  }

  async function add(){
    const parsedAmount = parseFloat(String(amount));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return alert('Enter a valid amount');
    if (!desc.trim()) return alert('Description required');
    const token = localStorage.getItem('token');
    try {
      setSubmitting(true);
      await axios.post('/api/proxy/expenses', { amount: parsedAmount, description: desc, category }, { headers: { Authorization: `Bearer ${token}` } });
      setAmount(''); setDesc(''); setCategory('misc');
      setStartDate(''); setEndDate(''); setFilterCategory('');
      fetchExpenses();
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to add expense.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  function getFilteredExpenses(){
    return expenses.filter(e=>{
      if (filterCategory && e.category !== filterCategory) return false;
      const d = new Date(e.createdAt);
      if (startDate && d < new Date(startDate)) return false;
      if (endDate && d > new Date(endDate)) return false;
      return true;
    });
  }

  function calculateSummary(period){
    const filtered = getFilteredExpenses();
    const now = new Date();
    let total = 0;
    filtered.forEach(e=>{
      const d = new Date(e.createdAt);
      if (period === 'week'){
        // same week number as now
        const oneJan = new Date(d.getFullYear(),0,1);
        const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay()+1)/7);
        const nowWeek = Math.ceil((((now - new Date(now.getFullYear(),0,1)) / 86400000) + new Date(now.getFullYear(),0,1).getDay()+1)/7);
        if (week === nowWeek && d.getFullYear() === now.getFullYear()) total += e.amount;
      } else if (period === 'month'){
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) total += e.amount;
      }
    });
    return total.toFixed(2);
  }

  return (
    <Layout title="Dashboard">
      <div className="container">
        <h1>Dashboard</h1>
      <div className="form">
        <input type="number" step="0.01" min="0" placeholder="amount" value={amount} onChange={e=>setAmount(e.target.value)} />
        <input placeholder="description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <select value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="misc">Misc</option>
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="utilities">Utilities</option>
        </select>
        {editingExpense ? (
          <>
            <button onClick={saveEdit} disabled={submitting}>{submitting ? 'Please wait...' : 'Update'}</button>
            <button onClick={cancelEdit} style={{marginLeft:4}} disabled={submitting}>Cancel</button>
          </>
        ) : (
          <button onClick={add} disabled={submitting}>{submitting ? 'Please wait...' : 'Add'}</button>
        )}
      </div>
      {/* filter controls */}
      <div className="filters">
        <h3>Filters</h3>
        <label>
          Start date: <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
        </label>
        <label>
          End date: <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
        </label>
        <label>
          Category: 
          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
            <option value="">All</option>
            <option value="misc">Misc</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities</option>
          </select>
        </label>
        <button className="clear-btn" onClick={()=>{setStartDate(''); setEndDate(''); setFilterCategory('');}}>Clear</button>
      </div>
      <div className="chart-container">
        <Chart expenses={getFilteredExpenses()} />
      </div>
      {/* summary section */}
      <div className="summary">
        <h3>Summary</h3>
        <p>Weekly: ${calculateSummary('week')}</p>
        <p>Monthly: ${calculateSummary('month')}</p>
        <p>Total: ${getTotal()}</p>
      </div>
      <button onClick={()=>{ localStorage.removeItem('token'); router.push('/'); }} style={{marginBottom:10}}>Logout</button>
      {getFilteredExpenses().length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <ul className="expense-list">
          {getFilteredExpenses().map(e=> (
            <li key={e.id}>
              <div>
                [{new Date(e.createdAt).toLocaleDateString()}] {e.description} - ${e.amount}
                <span className={`category-label category-${e.category}`}>{e.category}</span>
              </div>
              <div>
                <button onClick={()=>startEdit(e)}>Edit</button>
                <button onClick={()=>deleteExpense(e.id)} style={{marginLeft:4}}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
    </Layout>
  )
}
