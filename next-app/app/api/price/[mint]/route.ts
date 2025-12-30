import { NextResponse } from "next/server";

export async function GET(
   _req: Request,
   { params }: { params: Promise<{ mint: string }> }
) {
   const { mint } = await params;

   const jupUrl = `https://api.jup.ag/price/v3?ids=${mint}`;
   const orcaUrl = `https://api.orca.so/v2/solana/tokens/${mint}`;
   const raydiumUrl = `https://api-v3.raydium.io/mint/price?mints=${mint}`;

   try {
      const [jupRes, orcaRes, raydiumRes] = await Promise.all([
         fetch(jupUrl, {
            headers: { "x-api-key": process.env.JUP_API_KEY! },
         }).then(r => r.json()).catch(() => null),

         fetch(orcaUrl)
            .then(r => r.json())
            .catch(() => null),

         fetch(raydiumUrl)
            .then(r => r.json())
            .catch(() => null),
      ]);

      return NextResponse.json({
         mint,
         prices: {
            jup: jupRes ? jupRes[mint]?.usdPrice : null,
            orca: orcaRes ? orcaRes.data?.priceUsdc : null,
            radium: raydiumRes ? raydiumRes.data?.[mint] : null,
         },
      });
   } catch (err: any) {
      return NextResponse.json(
         { error: err.message || "Something went wrong" },
         { status: 500 }
      );
   }
}
