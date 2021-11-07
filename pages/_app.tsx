import { CssBaseline, Text } from "@nextui-org/react";
import Account from "components/account/Account";
import Layout from "components/Layout";
import { AppProps } from "next/dist/shared/lib/router/router";
import Head from "next/head";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "styles/index.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Head>
        <title>👋 Trainer. The missing UI for OpenAI.</title>
      </Head>
      <CssBaseline />
      <ToastContainer hideProgressBar />
      <Account>
        <Layout fullPage={pageProps.fullPage}>
          <Component {...pageProps} />
        </Layout>
      </Account>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error?: Error }
> {
  state: { error?: Error };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    toast.error(String(error));
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <Text h1 color="red">
          ${String(error)}
        </Text>
      );
    }

    return this.props.children;
  }
}
