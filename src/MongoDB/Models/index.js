import '../'
import { UserSchema } from './user'
import mongoose from 'mongoose'


export const User = mongoose.model('User');