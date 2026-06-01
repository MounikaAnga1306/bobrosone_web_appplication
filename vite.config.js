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
      '/bill/billers': 'http://localhost:5000',
'/bill/biller-logo':           'http://localhost:5000',
'/bill/validate-payment':      'http://localhost:5000',
'/bill/retrieve-recharge-plan':'http://localhost:5000',
'/bill/complaint':             'http://localhost:5000', 
'/bill/txn-search':            'http://localhost:5000',   
'/bill/send-otp':              'http://localhost:5000',  
'/bill/txn-details':           'http://localhost:5000', 
'/bill/verify-otp':            'http://localhost:5000', 
       '/bbps/billdesk/order':         'http://localhost:5000',
      '/bbps/makepayment':            'http://localhost:5000',
      '/offer': 'http://localhost:5000',
      '/cancel': 'http://localhost:5000',
      '/myAccount': 'http://localhost:5000',
       '/printTicket': 'http://localhost:5000',
      '/bookticket': 'http://localhost:5000',
      '/guestBookings': 'http://localhost:5000',
      '/myBookings': 'http://localhost:5000',
      '/rewardPoints': 'http://localhost:5000',
      '/searchTrips': 'http://localhost:5000',
      '/tripdetails': 'http://localhost:5000',
      '/blockTicket': 'http://localhost:5000',
      '/razorpayment': 'http://localhost:5000',
      '/billdesk': 'http://localhost:5000',
      '/verifyPayment': 'http://localhost:5000',
      '/cities': 'http://localhost:5000',
      '/cancellation-policy': 'http://localhost:5000',
      '/gmailverify': 'http://localhost:5000',
      '/db': 'http://localhost:5000',
    }
  }
})
