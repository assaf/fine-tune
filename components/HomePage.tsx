import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import NextLink from "next/link";
import packageJSON from "package.json";
import screenshot from "public/images/screenshot.png";
import React from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import SigninForm from "./account/SignInForm";
import useAuthentication from "./account/useAuthentication";

export default function HomePage() {
  const { isSignedIn } = useAuthentication();

  return (
    <>
      <Header />
      <div className="my-20 max-w-4xl mx-auto flex flex-col lg:flex-row gap-x-20 gap-y-8">
        <div className="py-10 mx-auto flex-shrink-0 w-96">
          {isSignedIn ? <WelcomeBack /> : <SigninForm />}
        </div>
        <Promo />
      </div>
      <Footer />
    </>
  );
}

function Header() {
  const { t } = useTranslation();

  return (
    <header>
      <h1>
        {t("app.title")}
        <span className="font-light ml-4">{t("app.subtitle")}</span>
      </h1>
    </header>
  );
}

function WelcomeBack() {
  return (
    <div className="my-10 w-96">
      <h2 className="text-2xl font-bold">Welcome back!</h2>
      <p className="text-lg">
        <NextLink href="/completions">
          <Button
            auto
            iconRight={<FontAwesomeIcon icon={faChevronRight} />}
            size="large"
          >
            Enter This Way
          </Button>
        </NextLink>
      </p>
    </div>
  );
}

function Promo() {
  const { data } = useSWR("advice", () =>
    fetch("https://api.adviceslip.com/advice").then((res) => res.json())
  );

  return (
    <section>
      <Image {...screenshot} />
      <ul className="mt-8 text-xl list-disc">
        <li>Go beyond the playground</li>
        <li>
          Create <b>fine tune</b> models for prompt completion
        </li>
        <li>
          Upload and manage files for <b>classification</b>
        </li>
        <li>
          Upload and manage files for <b>search</b>
        </li>
        {data && <li>{data.slip.advice}</li>}
      </ul>
    </section>
  );
}

function Footer() {
  const githubURL = packageJSON.repository.replace(
    /github:(.*).git/,
    "https://github.com/$1"
  );

  return (
    <footer>
      <p>
        For usage limits, terms and conditions, billing and charges, etc see
        your OpenAI. Use responsibly.
      </p>
      <p>
        ❤️ Created by <a href="https://labnotes.org">Assaf Arkin</a> &bull;{" "}
        <a href={githubURL}>GitHub</a>
      </p>
    </footer>
  );
}