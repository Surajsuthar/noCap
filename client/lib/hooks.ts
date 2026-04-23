"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemedHook() {
	const theme = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return {
			theme: "dark",
			setTheme: () => {},
			themes: ["light", "dark"],
			mounted: false,
		};
	}

	return {
		theme: theme.theme,
		setTheme: theme.setTheme,
		themes: theme.themes,
		mounted: true,
	};
}
