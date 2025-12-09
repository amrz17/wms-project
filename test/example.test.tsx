import { render, screen } from '@testing-library/react';

function Hello() {
  return <h1>Hello World</h1>;
}

describe("Example Test", () => {
  it("renders hello text", () => {
    render(<Hello />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
