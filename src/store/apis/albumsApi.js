import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { faker } from "@faker-js/faker";

// DEV ONLY
const pause = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

const albumsApi = createApi({
  reducerPath: "albums",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3005",
    // 會覆蓋所有 fetch 原本會進行的東西
    fetchFn: async (...args) => {
      // REMOVE FOR PRODUCTION
      await pause(1000);
      return fetch(...args);
    },
  }),
  endpoints(builder) {
    return {
      // give a simplified name
      // 決定 hook 的名字，之後要使用：albumsApi.useFetchAlbumsQuery()
      fetchAlbums: builder.query({
        // 通常是大寫字母開頭、單數
        // 第三個參數就是傳遞的參數（即data，在此為方便辨認叫做user），前兩個參數用不到但還是要接收
        // 要給予不同的 id 才不會導致所有有 album 的 tag 全部被重新渲染
        providesTags: (result, error, user) => {
          // 第一種 tag，每個 tag 對應一個專輯
          const tags = result.map((album) => {
            return { type: "Album", id: album.id };
          });
          // 增加第二種 tag，每個 tag 對應一個 user
          tags.push({ type: "UsersAlbums", id: user.id });
          return tags;
        },
        // query or mutation?
        query: (user) => {
          return {
            // path relative to the baseUrl
            url: "/albums",
            // query string
            params: {
              userId: user.id,
            },
            // method
            method: "GET",
            // no body
          };
        },
      }),
      addAlbum: builder.mutation({
        invalidatesTags: (result, error, user) => {
          return [{ type: "UsersAlbums", id: user.id }];
        },
        query: (user) => {
          return {
            url: "/albums",
            method: "POST",
            body: {
              userId: user.id,
              title: faker.commerce.productName(),
            },
          };
        },
      }),
      removeAlbum: builder.mutation({
        invalidatesTags: (result, error, album) => {
          return [{ type: "Album", id: album.id }];
        },
        query: (album) => {
          return {
            url: `/albums/${album.id}`,
            method: "DELETE",
          };
        },
      }),
    };
  },
});

export const {
  useFetchAlbumsQuery,
  useAddAlbumMutation,
  useRemoveAlbumMutation,
} = albumsApi;
export { albumsApi };
