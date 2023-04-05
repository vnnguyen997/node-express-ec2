import { Link } from 'react-router-dom';

const SomePage = () => {
  return (
    <div>
      <h1>Welcome to Some Page</h1>
      <Link to="/other-page">Go to Other Page</Link>
    </div>
  );
};