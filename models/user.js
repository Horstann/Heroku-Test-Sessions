const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required.']
    },
    password: {
        type: String,
        required: [true, 'Password is required.']
    }
})

userSchema.statics.findAndValidate = async function(username, password){
    try{
        const foundUser = await this.findOne({username: username});
        const isValid = await bcrypt.compare(password, foundUser.password);
        return isValid ? foundUser : false;
    }catch (e){
        console.log(e);
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;