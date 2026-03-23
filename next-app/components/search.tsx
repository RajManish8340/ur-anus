'use client'
import { useEffect, useRef, useState } from "react";

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
  const [click, setClick] = useState<boolean>(false)

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
        const res = await fetch(`/api/price/${selectedToken.id}`);
        const data = await res.json();
        setPriceData(data);
      } catch (err) {
        console.error("Failed to fetch price", err);
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 4000);

    return () => clearInterval(interval); // cleanup when token changes/unmounts
  }, [selectedToken]);


  return (
    <div className="flex flex-col items-center py-5">
      <div className="flex items-center">
        search for spl (solana program library tokens)
      </div>
      <div className="flex flex-col items-center justify-between m-2" >

        <input className="p-2 bg-red-300 font-black text-black rounded-2xl"
          placeholder="search token ......"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onClick={() => setClick(true)}
        />

        {click &&
          <ul className="m-2 bg-amber-300 text-black rounded-2xl">
            {filtered.slice(0, 7).map(t => (
              <li className="p-1"
                key={t.id}
                onClick={() => { setSelectedToken(t); setClick(false) }}
                style={{ cursor: "pointer" }}
              >
                {t.symbol} - {t.name}
              </li>
            ))}
          </ul>
        }
      </div>

      {
        selectedToken && (
          <div className="bg-orange-300 text-black rounded-md p-2">
            <h3>
              {selectedToken.symbol} - {selectedToken.name}
            </h3>
            <p className="wrap-anywhere">Mint: {selectedToken.id}</p>

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
        )
      }
    </div >
  );
}
