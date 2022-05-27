import { Story, Meta } from "@storybook/react";
import { Player, PlayerProps } from ".";

export default {
	component: Player,
	title: "Player",
} as Meta;

const Template: Story<PlayerProps> = args => (
	<div style={{ width: 1000 }}>
		<Player {...args} />
	</div>
);

export const Primary = Template.bind({});
Primary.args = {
	qualities: [
		{ src: "/1080.mp4", id: 5, label: "1080" },
		{ src: "/720.mp4", id: 4, label: "720" },
		{ src: "/640.mp4", id: 3, label: "640" },
		{ src: "/480.mp4", id: 2, label: "480" },
		{ src: "/subtitles.mp4", id: 1, label: "Default" },
	],
	captions: [{ language: "en", src: "/subtitles.vtt", label: "English" }],
};
