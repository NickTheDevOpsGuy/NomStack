interface Props {
  message: string;
}
export function ErrorMessage({ message }: Props) {
  return <p className="py-4 text-center text-red-600">{message}</p>;
}
