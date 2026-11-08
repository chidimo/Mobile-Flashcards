import { act, create } from "react-test-renderer";

import { useCountdown } from "../use-countdown";

const setup = (endsAt: number | null, onExpire: () => void) => {
  const ref: { current: number | null } = { current: null };
  const Probe = ({ at }: { at: number | null }) => {
    ref.current = useCountdown(at, onExpire);
    return null;
  };
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<Probe at={endsAt} />);
  });
  return { value: () => ref.current, tree, Probe };
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("useCountdown", () => {
  it("is null without a deadline", () => {
    const { value } = setup(null, jest.fn());

    expect(value()).toBeNull();
  });

  it("counts down in whole seconds", () => {
    const { value } = setup(Date.now() + 10_000, jest.fn());
    expect(value()).toBe(10);

    act(() => {
      jest.advanceTimersByTime(3_000);
    });

    expect(value()).toBe(7);
  });

  it("calls onExpire once when it reaches zero", () => {
    const onExpire = jest.fn();
    const { value } = setup(Date.now() + 2_000, onExpire);

    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(value()).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("stops when the deadline is cleared", () => {
    const onExpire = jest.fn();
    const { value, tree, Probe } = setup(Date.now() + 2_000, onExpire);

    act(() => tree.update(<Probe at={null} />));
    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(value()).toBeNull();
    expect(onExpire).not.toHaveBeenCalled();
  });
});
