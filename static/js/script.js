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

		watch(imageInput, (val) => {});

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

		// button convert
		async function onClickButtonConvert(e) {
			const body = new FormData();
			body.append("imageInput", imageInput.value);
			body.append("colorPalette", JSON.stringify(colorPalette.value));

			try {
				const response = await fetch("convert", {
					headers: {},
					method: "POST",
					body: body,
				});
				const data = await response.blob();

				// get file name
				const cd = response.headers.get("Content-Disposition");
				const match = cd.match(/filename=([^;]+)/);
				const filename = match && match[1];

				console.log(cd);
				console.log(match);
				console.log(filename);

				// convert file to blob and download
				const blobUrl = URL.createObjectURL(data);
				const downloadLink = document.createElement("a");
				downloadLink.href = blobUrl;
				downloadLink.download = filename;
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			} catch (err) {
				console.error(err);
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

			// event handlers
			onClickAddColorBtn,
			onImageInputChange,
			onClickButtonConvert,
		};
	},
});

app.config.compilerOptions.delimiters = ["${", "}"];
app.mount("#app");
