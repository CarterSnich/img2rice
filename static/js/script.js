const { createApp, ref, onBeforeMount, nextTick, watch } = Vue;

const app = createApp({
	setup() {
		// image
		const imageInput = ref(null);
		const image64 = ref("");

		// palette options
		const palettes = ref("");
		const paletteOption = ref("preset");
		const selectedPalettePreset = ref("");
		const colorPalette = ref([]);
		const customPalette = ref("");

		// loading indicator
		const isLoading = ref(0);

		// download
		const blobUrl = ref("");
		const downloadFilename = ref("");

		onBeforeMount(() => {
			(async () => {
				try {
					const response = await fetch("/get-palettes");
					palettes.value = await response.json();
					selectedPalettePreset.value = Object.keys(palettes.value)[0];
				} catch (err) {
					alert("Failed to fetch palettes.");
				}
			})();
		});

		watch(selectedPalettePreset, (val) => {
			colorPalette.value = palettes.value[val];
		});

		watch(customPalette, (val) => {
			const regex = /#[0-9A-Fa-f]{6}\b/g;
			colorPalette.value = val.match(regex) || [];
		});

		// image input
		function onImageInputChange(e) {
			const file = e.target.files[0];
			imageInput.value = file;

			if (file) {
				const fileReader = new FileReader();
				fileReader.addEventListener("load", (e) => {
					image64.value = e.target.result;
				});
				fileReader.readAsDataURL(file);
			}
		}

		// color palette
		function onClickAddColorBtn(e) {
			if (colorInput.value) {
				colorPalette.value.push(colorInput.value);
				colorInput.value = "";
			}
		}

		// close button
		function onClickCloseButton(e) {
			isLoading.value = 0; // converted|download, and closed
		}

		// button convert
		async function onClickButtonConvert(e) {
			const body = new FormData();
			body.append("imageInput", imageInput.value);
			body.append("colorPalette", JSON.stringify(colorPalette.value));

			try {
				isLoading.value = 1; // converting
				const response = await fetch("convert", {
					headers: {},
					method: "POST",
					body: body,
				});
				const data = await response.blob();
				isLoading.value = 2; // for download

				// get file name
				const cd = response.headers.get("Content-Disposition");
				const match = cd.match(/filename=([^;]+)/);
				const filename = match && match[1];

				// convert file to blob and download
				blobUrl.value = URL.createObjectURL(data);
				downloadFilename.value = filename;
			} catch (err) {
				console.error(err);
				alert(err);
			}
		}

		return {
			// image input
			imageInput,

			// color palette
			palettes,

			// palette options
			paletteOption,
			colorPalette,
			selectedPalettePreset,
			customPalette,

			// image input
			image64,

			// loading indicator
			isLoading,

			// download
			blobUrl,
			downloadFilename,

			// event handlers
			onClickAddColorBtn,
			onImageInputChange,
			onClickButtonConvert,
			onClickCloseButton,
		};
	},
});

app.config.compilerOptions.delimiters = ["${", "}"];
app.mount("#app");
