import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState,useEffect } from 'react';

const YOUTUBE_PLAYLIST_ITEMS_API = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLOHoVaTp8R7dfrJW5pumS0iD_dhlXKv17&maxResults=50&key=${process.env.YOUTUBE_API_KEY}`;
//const YOUTUBE_PLAYLIST_ITEMS_API = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&key=${process.env.YOUTUBE_API_KEY}`;
export async function getServerSideProps(){
  const res = await fetch(YOUTUBE_PLAYLIST_ITEMS_API)
  //const res = await fetch(`${YOUTUBE_PLAYLIST_ITEMS_API}?part=snippet&playlistId=PLOHoVaTp8R7dfrJW5pumS0iD_dhlXKv17&maxResults=50&key=${process.env.YOUTUBE_API_KEY}`);
  const data = await res.json();
  return {
    props: {data
    },
  }
}


export default function Home({data}) {
  //console.log('data',data);
  const {info, items: defaultItems = [] } = data;
  const [items, updateItems] = useState(defaultItems);
  const [page, updatePage] = useState({
    ...info,
    current: YOUTUBE_PLAYLIST_ITEMS_API
  });

  const { current } = page;

  useEffect(() => {
    if ( current === YOUTUBE_PLAYLIST_ITEMS_API ) return;
  
    async function request() {
      const res = await fetch(current)
      const nextData = await res.json();
  
      updatePage({
        current,
        ...nextData.info
      });
  
      if ( !nextData.info?.prev ) {
        updateItems(nextData.items);
        return;
      }
  
      updateItems(prev => {
        return [
          ...prev,
          ...nextData.items
        ]
      });
    }
  
    request();
  }, [current]);

  function handleOnSubmitId(e) {
    e.preventDefault();
    const { currentTarget = {} } = e;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find(field => field.name === 'playlistId');
    const value = fieldQuery.value || '';
    const endpoint =`${YOUTUBE_PLAYLIST_ITEMS_API}?part=snippet&playlistId=${value}&maxResults=50&key={YOUR_API_KEY_HERE}`; //add your api key for the moment test 
  
    updatePage({
      current: endpoint
    });
  }
  



  return (
    <div className={styles.container}>
      <Head>
        <title>Youtube Playlist API Test</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          The Playlist
        </h1>

        <form className = "addPlaylist" onSubmit={handleOnSubmitId}>
          <input name='playlistId' type="text" required placeholder='playlist id' />
          <button type="submit">add</button>
        </form>


        <ul className={styles.grid}>
          {items.map(({ id, snippet = {} }) => {
            const { title, thumbnails = {}, resourceId = {} } = snippet;
            const { medium } = thumbnails;
            return (<li key = {id} className={styles.card}>
              <a href={`https://www.youtube.com/watch?v=${resourceId.videoId}`}>
                <p><img width={medium.width} height={medium.height} src={medium.url} alt="" />
                </p>
                <h3>{title}</h3>
              </a>
            </li>
            )
          })}
        </ul>
      </main>
    </div>
  )
}
