import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
   server: {
    proxy: {
      
      '/rewardPoints': 'http://localhost:5000',
      '/searchTrips': 'http://localhost:5000',
      '/tripdetails': 'http://localhost:5000',
      '/blockTicket': 'http://localhost:5000',
      '/razorpayment': 'http://localhost:5000',
      '/billdesk': 'http://localhost:5000',
      '/verifyPayment': 'http://localhost:5000',
      '/cities': 'http://localhost:5000',
    }
  }
})
