import styled from "@emotion/styled";

export const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #242424;
  color: white;
  width: 100vw;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
  }

  button {
    padding: 1rem 2rem;
    background-color: #22c55e;
    border-radius: 0.5rem;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    border: none;
    text-transform: uppercase;

    &:hover {
      background-color: #16a34a;
    }
  }
`;
