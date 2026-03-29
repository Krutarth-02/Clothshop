const  express = require('express');
const app = express();
//routes
const authRoute = require('./routes/auth.route');

//middleware
app.use(express.json());
app.use('/api/auth',authRoute);

//Port setup
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server running....${port}`);
})