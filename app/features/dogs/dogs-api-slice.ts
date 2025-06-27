import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Posts {
    id: string;
    title: string;
    body: string;
}

interface PostsApi {
    success: boolean;
    message: string;
    data: Posts[];
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://api-gateway-amber.vercel.app/orders/posts/api',
    }),
    endpoints(builder) {
        return {
            fetchPosts: builder.query<Posts[], number | void>({
                query(limit = 10) {
                    return `/listPosts?limit=${limit}`;
                },
                transformResponse: (response: PostsApi) => response.data,
            })
        }
    }
});

export const { useFetchPostsQuery } = apiSlice;
