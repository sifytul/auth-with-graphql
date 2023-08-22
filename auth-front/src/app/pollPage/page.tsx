"use client";

export const dynamic = "force-dynamic";

import { gql } from "@apollo/client";

const query = gql`
  query {
    launchLatest {
      mission_name
    }
  }
`;

export default function PollPage() {
  return <div>hello poll</div>;
}
