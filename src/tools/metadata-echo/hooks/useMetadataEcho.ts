/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from "react";
import {
  getBasicMetadata,
  getAdvancedMetadata,
  BasicMetadata,
  AdvancedMetadata,
} from "../lib/metadata";

export interface UseMetadataEchoReturn {
  basic: BasicMetadata | null;
  advanced: AdvancedMetadata | null;
  loading: boolean;
  loadAdvanced: () => Promise<void>;
}

const useMetadataEcho = (): UseMetadataEchoReturn => {
  const [basic, setBasic] = useState<BasicMetadata | null>(null);
  const [advanced, setAdvanced] = useState<AdvancedMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBasic(getBasicMetadata());
  }, []);

  const loadAdvanced = async () => {
    setLoading(true);
    const adv = await getAdvancedMetadata();
    setAdvanced(adv);
    setLoading(false);
  };

  return { basic, advanced, loading, loadAdvanced };
};

export default useMetadataEcho;
