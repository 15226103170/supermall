import { request } from "./request"

export function getHomeMultidata() {
    return request({
        url: '/home/multidata'
        // url: '/api/home/multidata'
    })
}