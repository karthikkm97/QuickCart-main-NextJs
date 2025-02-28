import mongoose from "mongoose";


const AddressSchema = new mongoose.Schema(
    {
        userId: {
          type: String,
          required: true,
        },
    
        fullname: {
          type: String,
          required: true,
        },
        phoneNumber: {
            type: Number,
            required: true,
        },

        pincode: {
            type: Number,
            required: true,
        },
        area: {
            type:String,
            required:true,
        },
        state: {
            type:String,
            required:true,
        },
        city: {
            type:String,
            required:true,
        },
        
})

const Address = mongoose.models.address ||  mongoose.model('address',AddressSchema)

export default Address 
