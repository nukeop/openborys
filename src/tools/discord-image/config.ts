export type GptImage25Input = {
	prompt: string;
	input_images?: string[];
	aspect_ratio?:
		| '1:1'
		| '3:2'
		| '2:3'
		| '4:3'
		| '3:4'
		| '16:9'
		| '9:16'
		| 'auto';
	quality?: 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'auto';
	output_format?: 'webp' | 'png' | 'jpeg';
	background?: 'auto' | 'opaque';
	moderation?: 'auto' | 'low';
	number_of_images?: number;
};

export type NanoBanana2Input = {
	prompt: string;
	image_input?: string[];
	aspect_ratio?:
		| '1:1'
		| '2:3'
		| '3:2'
		| '3:4'
		| '4:3'
		| '4:5'
		| '5:4'
		| '9:16'
		| '16:9'
		| '21:9'
		| '1:4'
		| '4:1'
		| '1:8'
		| '8:1'
		| 'match_input_image';
	resolution?: '1K' | '2K' | '4K';
	output_format?: 'jpg' | 'png';
};

type ModelOption = {
	name: string;
	values: string[];
	default: string;
	botVisible: boolean;
	prices?: Record<string, string>;
};

type ImageModelConfig = {
	replicateId: `${string}/${string}`;
	imageInputField: string;
	options: ModelOption[];
	fixedFields?: Record<string, string>;
};

export const modelConfig = {
	'gpt-image-2.5-flare': {
		replicateId: 'openai/gpt-image-2.5-flare',
		imageInputField: 'input_images',
		fixedFields: { moderation: 'low', background: 'opaque' },
		options: [
			{
				name: 'aspect_ratio',
				values: ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', 'auto'],
				default: '1:1',
				botVisible: true,
			},
			{
				name: 'quality',
				values: ['low', 'medium', 'high', 'xhigh', 'max', 'auto'],
				default: 'low',
				botVisible: true,
				prices: {
					low: '$0.012',
					medium: '$0.047',
					high: '$0.128',
					xhigh: '$0.25',
					max: '$0.50',
					auto: '$0.25',
				},
			},
			{
				name: 'output_format',
				values: ['webp', 'png', 'jpeg'],
				default: 'jpeg',
				botVisible: false,
			},
		],
	},
	'gpt-image-2.5-sunburst': {
		replicateId: 'openai/gpt-image-2.5-sunburst',
		imageInputField: 'input_images',
		fixedFields: { moderation: 'low', background: 'opaque' },
		options: [
			{
				name: 'aspect_ratio',
				values: ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', 'auto'],
				default: '1:1',
				botVisible: true,
			},
			{
				name: 'quality',
				values: ['low', 'medium', 'high', 'xhigh', 'max', 'auto'],
				default: 'low',
				botVisible: true,
				prices: {
					low: '$0.012',
					medium: '$0.047',
					high: '$0.128',
					xhigh: '$0.25',
					max: '$0.50',
					auto: '$0.25',
				},
			},
			{
				name: 'output_format',
				values: ['webp', 'png', 'jpeg'],
				default: 'jpeg',
				botVisible: false,
			},
		],
	},
	'nano-banana-2': {
		replicateId: 'google/nano-banana-2',
		imageInputField: 'image_input',
		fixedFields: {},
		options: [
			{
				name: 'aspect_ratio',
				values: [
					'1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4',
					'9:16', '16:9', '21:9', '1:4', '4:1', '1:8', '8:1',
				],
				default: '1:1',
				botVisible: true,
			},
			{
				name: 'resolution',
				values: ['1K', '2K', '4K'],
				default: '1K',
				botVisible: true,
				prices: {
					'1K': '$0.067',
					'2K': '$0.101',
					'4K': '$0.151',
				},
			},
			{
				name: 'output_format',
				values: ['jpg', 'png'],
				default: 'jpg',
				botVisible: false,
			},
		],
	},
} as const satisfies Record<string, ImageModelConfig>;

export type ImageModelName = keyof typeof modelConfig;

const formatValue = (
	value: string,
	price: string | undefined,
): string => {
	if (price) {
		return `${value} (${price})`;
	}
	return value;
};

const formatOption = (option: ModelOption): string => {
	const formatted = option.values
		.map((v) => formatValue(v, option.prices?.[v]))
		.join(', ');
	return `  ${option.name}: ${formatted} [default: ${option.default}]`;
};

const describeModel = (
	name: string,
	config: ImageModelConfig,
): string => {
	const visible = config.options.filter((o) => o.botVisible);
	const lines = visible.map(formatOption);
	return `${name}:\n${lines.join('\n')}`;
};

export const modelOptionsDescription = (
	Object.keys(modelConfig) as ImageModelName[]
)
	.map((name) => describeModel(name, modelConfig[name]))
	.join('\n');
