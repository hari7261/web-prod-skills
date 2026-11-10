export function BadButton({ onClick }: { onClick: () => void }) {
  return <div onClick={onClick}><img src="/icon.png" /></div>;
}

