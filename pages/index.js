import Feature from "../components/Feature";
import Pricing from "../components/Pricing";
import Hero from "../components/Hero";
import Layout from "../components/Layout/Layout";
import SeoHead from "../components/SeoHead";
import { useState } from "react";


export default function Home() {

  const [guestView, setGuestView] = useState("candidate");
  
  return (
    <>
      <SeoHead title='SkillfulJobs.ai' />
      <Layout   
      guestView={guestView} setGuestView={setGuestView}>
        <Hero guestView={guestView} setGuestView={setGuestView} />
        <Feature guestView={guestView} />
      </Layout>
    </>
  );
}
