import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Chart({ expenses }){
  // group expenses by date and sum amounts
  const grouped = expenses.reduce((acc,e)=>{
    const d = new Date(e.createdAt).toLocaleDateString();
    acc[d] = (acc[d] || 0) + e.amount;
    return acc;
  }, {});
  const labels = Object.keys(grouped).sort((a,b)=> new Date(a) - new Date(b));
  const data = { labels, datasets: [{ label: 'Expenses', data: labels.map(l=>grouped[l]), backgroundColor: 'rgba(75,192,192,0.6)' }] };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Expenses' },
    },
    scales: { y: { beginAtZero: true } }
  };
  return <Bar data={data} options={options} />
}
