'use client'
import { useEffect, useState } from "react";

type Token = {
   id: string;
   name: string;
   symbol: string;
};

export default function TokenSearch() {
   const [tokens, setTokens] = useState<Token[]>([]);
   const [query, setQuery] = useState("");
   const [selectedToken, setSelectedToken] = useState<Token | null>(null);
   const [priceData, setPriceData] = useState<any>(null);

   useEffect(() => {
      async function load() {
         const rep = await fetch("/tokens_min.json");
         const data = await rep.json();
         setTokens(data);
      }
      load();
   }, []);

   const filtered = tokens.filter(t =>
      t.symbol.toLowerCase().includes(query.toLowerCase()) ||
      t.name.toLowerCase().includes(query.toLowerCase())
   );

   useEffect(() => {
      if (!selectedToken) return;

      async function fetchPrice() {
         try {
            //@ts-ignore
            const res = await fetch(`http://127.0.0.1:3001/price/${selectedToken.id}`);
            const data = await res.json();
            setPriceData(data);
         } catch (err) {
            console.error("Failed to fetch price", err);
         }
      }

      fetchPrice(); const interval = setInterval(fetchPrice, 3000);

      return () => clearInterval(interval); // cleanup when token changes/unmounts
   }, [selectedToken]);

   return (
      <div className="flex items-center justify-around">
         <div>

            <input className="p-2 bg-red-200"
               placeholder="search token ......"
               value={query}
               onChange={e => setQuery(e.target.value)}
            />

            <ul className="bg-amber-50">
               {filtered.slice(0, 15).map(t => (
                  <li className="p-1 border-b-blue-400"
                     key={t.id}
                     onClick={() => setSelectedToken(t)}
                     style={{ cursor: "pointer" }}
                  >
                     {t.symbol} - {t.name}
                  </li>
               ))}
            </ul>
         </div>

         {selectedToken && (
            <div className="bg-cyan-100">
               <h3>
                  {selectedToken.symbol} - {selectedToken.name}
               </h3>
               <p>Mint: {selectedToken.id}</p>

               {priceData ? (
                  <>
                     <p>Jupiter: {priceData.prices?.jup ?? "N/A"}</p>
                     <p>Orca: {priceData.prices?.orca ?? "N/A"}</p>
                     <p>Raydium: {priceData.prices?.radium ?? "N/A"}</p>
                  </>
               ) : (
                  <p>Loading price...</p>
               )}
            </div>
         )}
      </div>
   );
}
