import React from "react";
import Layout from "../../../../components/Layout/Layout";
import MyApplication from "../../Dashboard/MyApplication/MyApplication";

export default function MyApplicationPage() {
  return (
   <>
        <Layout >
          <main className="min-h-screen pb-12 pt-28">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <MyApplication />
        </div>
        </main>
        </Layout>
   </>
    
    
  );
}