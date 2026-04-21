import { useEffect, useState } from "react";
import axios from "axios";

type CrowdData = {
  zone: string;
  count: number;
  capacity: number;
  status: string;
};

export default function Crowd() {
  const [data, setData] = useState<CrowdData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urls = [
          "/api/dh/crowd1",
          "/api/dh/crowd2",
          "/api/dh/crowd3",
          "/api/dh/crowd4",
        ];

        const responses = await Promise.all(
          urls.map((url) => axios.get(`https://noq-1.onrender.com/api${url}`))
        );

        const result: CrowdData[] = responses.map((res) => res.data);
        setData(result);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);

  }, []);

  return (
    <div>
      <h2>Dining Hall Crowd</h2>

      {data.map((hall, index) => (
        <div key={index}>
          <p><b>{hall.zone}</b></p>
          <p>Count: {hall.count}</p>
          <p>Capacity: {hall.capacity}</p>
          <p>Status: {hall.status}</p>
        </div>
      ))}
    </div>
  );
}