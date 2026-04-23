import { configureStore } from '@reduxjs/toolkit'
import { sessionReducer as session } from './reducers/session'
import { productReducer as product } from './reducers/product'
import { tagReducer as tag } from './reducers/tag'
import { variantReducer as variant } from './reducers/variant'
import { videoReducer as video } from './reducers/video'
import { orderReducer as order } from './reducers/order'
import { userReducer as user } from './reducers/user'

export const store = configureStore({
  reducer: {
    session,
    product,
    tag,
    variant,
    video,
    order,
    user
  }, 
})