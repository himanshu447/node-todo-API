const mongoose = require('mongoose');

mongoose.connect(process.env.MONGOOSE_DB_URL, () => {
    console.log('Mongoose Connected!');
});
