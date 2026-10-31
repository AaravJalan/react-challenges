import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAarMVhsPVIxfLw4cqiQWWir-51apbn-FU",
  authDomain: "cs392-react-challenges.firebaseapp.com",
  databaseURL: "https://cs392-react-challenges-default-rtdb.firebaseio.com",
  projectId: "cs392-react-challenges",
  storageBucket: "cs392-react-challenges.firebasestorage.app",
  messagingSenderId: "1088275209127",
  appId: "1:1088275209127:web:a37eb641abb770bce37482"
};

const firebase = initializeApp(firebaseConfig);
export const database = getDatabase(firebase);

export const useDataQuery = <T = unknown>(path: string): [T | undefined, boolean, Error | undefined] => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    return onValue(
      ref(database, path),
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );
  }, [path]);

  return [data, loading, error];
};
