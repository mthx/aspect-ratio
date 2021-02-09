import { Box } from "@chakra-ui/react";
import { findApproximateAspectRatio, Fraction } from "./fraction";
import { findClosestCommonAspectRatio } from "./ratios";

interface AspectInfoProps {
  width: number;
  height: number;
}

const AspectInfo = ({ width, height }: AspectInfoProps) => {
  const value = new Fraction(width, height);
  const approx = findApproximateAspectRatio(value);
  const common = findClosestCommonAspectRatio(value);
  return (
    <Box fontSize="lg" color="white" fontWeight="bold">
      <AspectInfoItem label="Exactly" value={value} />
      {approx.fraction.compareTo(value) !== 0 && (
        <AspectInfoItem
          label="Approx."
          value={approx.fraction}
          error={approx.error}
        />
      )}
      {common.fraction.compareTo(value) !== 0 && (
        <AspectInfoItem
          label="Closest common is "
          value={common.fraction}
          error={common.error}
        />
      )}
    </Box>
  );
};

interface AspectInfoItemProps {
  label: string;
  value: Fraction;
  error?: number;
}

const AspectInfoItem = ({ label, value, error }: AspectInfoItemProps) => (
  <Box>
    {label} <span>{value.toString().replace("/", ":")}</span>
    {error && <span> ({(error * 100).toFixed(2)}% error)</span>}
  </Box>
);

export default AspectInfo;
